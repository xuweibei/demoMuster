import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, Upload } from 'antd';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//业务接口方法引入
import { getByPayeeType, importPos } from '@/actions/base';


const FormItem = Form.Item;
const { TextArea } = Input;
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

class PoseView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            partner_list: [],
        };

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    componentWillMount() {
        
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                if (this.props.editMode == 'Edit') {
                    this.props.viewCallback({ posId: this.state.dataModel.posId, ...values });//合并保存数据
                }
                if (this.props.editMode == 'SetPatch') {
                    this.props.viewCallback({ posIds: this.state.dataModel.posIds.join(','), ...values })
                }
                if (this.props.editMode == 'Create') {
                    this.props.viewCallback({ ...values });//合并保存数据
                }
               
            }
        });
    }

  

    //标题
    getTitle() {
        let op = '';
        if (this.props.editMode == 'SetPatch') {
            op = '批量设置'
        }
       
        if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
            op = getViewEditModeTitle(this.props.editMode);
        }
        return `${op}Pos机`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{this.props.editMode == 'SetPatch' || this.props.editMode == 'Import' ? '确定' : getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
      
        JSON.stringify(this.state.dataModel)
        switch (this.props.editMode) {
          
            case "SetPatch":
                var title = "您选择了" + `${this.state.dataModel.posIds.length}` + "个终端编号进行所属分部的调整";
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
                                        initialValue: dataBind(this.state.dataModel.branchId),
                                    })(
                                        <SelectFBOrg scope={'all'} hideAll={false} />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>

                    </Form>
                )
                break;
            case "Create":
            case "Edit":
                block_content = (
                    <Form >
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="终端编号"
                                >
                                    {getFieldDecorator('posCode', {
                                        initialValue: dataBind(this.state.dataModel.posCode),
                                        rules: [{
                                            required: true, message: '请选择终端编号!',
                                        }],
                                    })(
                                        <Input placeholder='请输入终端编号'/>
                                        )}

                                </FormItem>
                            </Col>
                            {!this.state.disable && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="终端名称"
                                >
                                    {getFieldDecorator('posName', {
                                        initialValue: dataBind(this.state.dataModel.posName),
                                        rules: [{
                                            required: true, message: '请选择终端名称!',
                                        }],
                                    })(
                                        <Input placeholder='请输入终端名称'/>
                                        )}

                                </FormItem>
                            </Col>
                            }

                          <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="设备编号"
                                >
                                    {getFieldDecorator('posNum', {
                                        initialValue: dataBind(this.state.dataModel.posNum),
                                        rules: [{
                                            required: true, message: '请选择设备编号!',
                                        }],
                                    })(
                                        <Input placeholder='请输入设备编号'/>
                                        )}

                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商户号"
                                >
                                    {getFieldDecorator('shopNum', {
                                        initialValue: dataBind(this.state.dataModel.shopNum),
                                        rules: [{
                                            required: true, message: '请选择商户号!',
                                        }],
                                    })(
                                        <Input placeholder='请输入商户号'/>
                                        )}

                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属分部"
                                >
                                    {getFieldDecorator('branchId', {
                                        initialValue: dataBind(this.state.dataModel.branchId),
                                        rules: [{
                                            required: true, message: '请选择分部!',
                                        }],
                                    })(
                                        <SelectFBOrg scope={'all'} hideAll={false} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="发行机构"
                                >
                                    {getFieldDecorator('institution', {
                                        initialValue: this.state.dataModel.institution
                                    })(
                                        <Input placeholder='请输入发行机构'/>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('status', {
                                        initialValue: dataBind(this.state.dataModel.status),
                                        rules: [{
                                            required: true, message: '请选择状态!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value=''>--请选择状态--</Option>
                                            {this.props.dic_Status.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="说明"
                                >
                                    {getFieldDecorator('remark', {
                                        initialValue: this.state.dataModel.remark,
                                    })(
                                        <TextArea　placeholder='请输入说明' rows={4} />
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

const WrappedBankAccountView = Form.create()(PoseView);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        getByPayeeType: bindActionCreators(getByPayeeType, dispatch),
        importPos: bindActionCreators(getByPayeeType, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedBankAccountView);
