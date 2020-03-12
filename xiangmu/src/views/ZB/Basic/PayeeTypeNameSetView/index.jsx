import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';

import { loadDictionary } from '@/actions/dic';

import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
//业务接口方法引入



const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const CheckboxGroup = Checkbox.Group;
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
                this.props.viewCallback({ branchIds: this.state.dataModel.join(','), zbPayeeTypes: values.zbPayeeTypes.join(',') });
            }
        });
    }
   
    
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}分部个人订单收费方`;
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
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form >
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="收费方"
                                >
                                    {getFieldDecorator('zbPayeeTypes', { 
                                        rules: [{ required: true, message: '请选择收费方!' }] })(
                                        <CheckboxGroup onChange={this.onSelectChange}>
                                            {
                                            this.state.payee_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').map((item, index) => {
                                                return <Checkbox value={item.value} key={index}>{item.title}</Checkbox>
                                            })
                                            }
                                        </CheckboxGroup>
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
