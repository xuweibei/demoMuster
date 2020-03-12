import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';

import { loadDictionary } from '@/actions/dic';

import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//业务接口方法引入



const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class PayeeTypeNameSetView extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
       
    }
    componentWillMount() {
        this.loadBizDictionary(['payee_type']);
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ orderIds: this.state.dataModel.join(','), branchId:values.branchId,regionId: values.regionId });
            }
        });
    }
   
    
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `批量调整学生订单所属分部`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }

  
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        var title = "您选择了" + `${this.state.dataModel.length}` + "个订单进行所属分部的调整";
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
            block_content = (
                <Form>
                    <Row>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout}

                                label={title}
                            >

                            </FormItem>
                            <FormItem
                                {...searchFormItemLayout}
                                label="请选择分部"
                            >
                                {getFieldDecorator('branchId', {
                                    initialValue: '',
                                    rules: [{
                                        required: true, message: '请选择分部!'
                                    }]
                                })(
                                    <SelectFBOrg scope={'all'} hideAll={true}  onChange={(value) => {
                                        this.setState({ branchId: value });
                                        setTimeout(() => {
                                          this.props.form.resetFields(['regionId']);
                                        }, 500);
                                      }}/>
                                    )}
                            </FormItem>
                            <FormItem
                            {...searchFormItemLayout}
                            label="请选择分部区域"
                            >
                            {getFieldDecorator('regionId', {
                                initialValue: '',
                                rules: [{
                                    required: true, message: '请选择区域!'
                                }]
                            })(
                                <SelectArea scope='all' branchId={this.state.branchId} hideAll={true} showCheckBox={false} />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                </Form>
            );
            break;

        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedPayeeTypeNameSetView = Form.create()(PayeeTypeNameSetView);

const mapStateToProps = (state) => {
    //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPayeeTypeNameSetView);
